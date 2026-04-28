<?php

namespace App\Controller\Api;

use App\Repository\InvoiceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/dashboard')]
class DashboardController extends AbstractController
{
    #[Route('/summary', name: 'api_dashboard_summary', methods: ['GET'])]
    public function getSummary(InvoiceRepository $invoiceRepository): JsonResponse
    {
        $invoices = $invoiceRepository->findAll();
        $totalOutstanding = 0;

        foreach ($invoices as $invoice) {
            foreach ($invoice->getInvoiceItems() as $item) {
                $totalOutstanding += ($item->getQuantity() * $item->getUnitPrice());
            }
        }

        return $this->json([
            'totalOutstanding' => (float) $totalOutstanding,
            'invoiceCount' => count($invoices),
        ]);
    }
}
