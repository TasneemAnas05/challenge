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
    #[Route('', name: 'api_invoices_list', methods: ['GET'])]
    public function index(InvoiceRepository $repository): JsonResponse
    {
        $invoices = $repository->findAll();
        return $this->json($invoices, 200, [], ['groups' => 'invoice:read']);
    }

    #[Route('', name: 'api_invoices_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, ClientRepository $clientRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $invoice = new Invoice();
        $invoice->setInvoiceNumber($data['invoiceNumber']);
        $invoice->setInvoiceDate(new DateTimeImmutable($data['invoiceDate']));
        $invoice->setDueDate(new DateTimeImmutable($data['dueDate']));
        $invoice->setStatus($data['status'] ?? 'Draft');

        $client = $clientRepo->find($data['clientId']);
        if (!$client) {
            return $this->json(['error' => 'Client not found'], 404);
        }
        $invoice->setClient($client);

        $totalAmountNet = 0;
        $totalAmountVat = 0;

        foreach ($data['items'] as $itemData) {
            $item = new InvoiceItem();
            $item->setDescription($itemData['description']);
            $item->setQuantity($itemData['qty']);
            $item->setUnitPrice($itemData['rate']);

            $vatRate = $itemData['vatRate'] ?? 0;
            $item->setVatRate($vatRate);

            $totalLineNet = $itemData['qty'] * $itemData['rate'];
            $item->setTotalLineNet((string) $totalLineNet);

            $invoice->addInvoiceItem($item);

            $totalAmountNet += $totalLineNet;
            $totalAmountVat += $totalLineNet * ($vatRate / 100);
        }

        $invoice->setTotalAmountNet((string) $totalAmountNet);
        $invoice->setTotalAmountVat((string) $totalAmountVat);
        $invoice->setTotalAmountGross((string) ($totalAmountNet + $totalAmountVat));

        $em->persist($invoice);
        $em->flush();

        return $this->json($invoice, 201, [], ['groups' => 'invoice:read']);
    }
}
