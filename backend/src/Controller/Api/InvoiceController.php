<?php

namespace App\Controller\Api;

use App\Entity\Invoice;
use DateTimeImmutable;
use App\Entity\InvoiceItem;
use App\Repository\ClientRepository;
use App\Repository\InvoiceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/invoices')]
class InvoiceController extends AbstractController
{
    #[Route('', name: 'api_invoices_index', methods: ['GET'])]
    public function index(InvoiceRepository $repository): JsonResponse
    {
        $invoices = $repository->findAll();
        
        $data = array_map(function ($invoice) {
            return [
                'id' => $invoice->getId(),
                'invoiceNumber' => $invoice->getInvoiceNumber(),
                'invoiceDate' => $invoice->getInvoiceDate()?->format('Y-m-d'),
                'dueDate' => $invoice->getDueDate()?->format('Y-m-d'),
                'status' => $invoice->getStatus(),
                'totalAmountGross' => $invoice->getTotalAmountGross(),
                'client' => $invoice->getClient() ? [
                    'id' => $invoice->getClient()->getId(),
                    'name' => $invoice->getClient()->getName()
                ] : null
            ];
        }, $invoices);

        return $this->json($data, 200);
    }

    #[Route('', name: 'api_invoices_new', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, ClientRepository $clientRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['invoiceNumber']) || empty($data['clientId'])) {
            return $this->json(['error' => 'Missing required fields (invoiceNumber, clientId)'], 400);
        }

        $invoice = new Invoice();
        $invoice->setInvoiceNumber($data['invoiceNumber']);
        try {
            $invoice->setInvoiceDate(new DateTimeImmutable($data['invoiceDate'] ?? 'now'));
            $invoice->setDueDate(new DateTimeImmutable($data['dueDate'] ?? 'now'));
        } catch (\Exception $e) {
            return $this->json(['error' => 'Invalid date format provided'], 400);
        }
        $invoice->setStatus($data['status'] ?? 'Draft');

        $client = $clientRepo->find($data['clientId']);
        if (!$client) {
            return $this->json(['error' => 'Client not found'], 404);
        }
        $invoice->setClient($client);

        $totalAmountNet = 0;
        $totalAmountVat = 0;

        $items = $data['items'] ?? [];
        foreach ($items as $itemData) {
            $item = new InvoiceItem();
            $item->setDescription($itemData['description'] ?? '');
            
            $quantity = $itemData['quantity'] ?? 1;
            $unitPrice = $itemData['unitPrice'] ?? 0;

            $item->setQuantity((string) $quantity);
            $item->setUnitPrice((string) $unitPrice);

            $vatRate = $itemData['vatRate'] ?? 0;
            $item->setVatRate((string) $vatRate);

            $totalLineNet = $quantity * $unitPrice;
            $item->setTotalLineNet((string) $totalLineNet);

            $invoice->addInvoiceItem($item);
            
            $item->setInvoice($invoice); 
            $em->persist($item);

            $totalAmountNet += $totalLineNet;
            $totalAmountVat += $totalLineNet * ($vatRate / 100);
        }

        $invoice->setTotalAmountNet((string) $totalAmountNet);
        $invoice->setTotalAmountVat((string) $totalAmountVat);
        $invoice->setTotalAmountGross((string) ($totalAmountNet + $totalAmountVat));

        $em->persist($invoice);
        $em->flush();

        $responseData = [
            'id' => $invoice->getId(),
            'invoiceNumber' => $invoice->getInvoiceNumber(),
            'invoiceDate' => $invoice->getInvoiceDate()?->format('Y-m-d'),
            'dueDate' => $invoice->getDueDate()?->format('Y-m-d'),
            'status' => $invoice->getStatus(),
            'totalAmountGross' => $invoice->getTotalAmountGross(),
            'client' => $invoice->getClient() ? [
                'id' => $invoice->getClient()->getId(),
                'name' => $invoice->getClient()->getName()
            ] : null
        ];

        return $this->json($responseData, 201);
    }

    #[Route('/{id}', name: 'api_invoices_delete', methods: ['DELETE'])]
    public function delete(int $id, InvoiceRepository $repository, EntityManagerInterface $em): JsonResponse
    {
        $invoice = $repository->find($id);
        if (!$invoice) {
            return $this->json(['error' => 'Invoice not found'], 404);
        }

        $em->remove($invoice);
        $em->flush();

        return $this->json(null, 204);
    }
}
