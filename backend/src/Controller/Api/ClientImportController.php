<?php

namespace App\Controller\Api;

use App\Entity\Client;
use App\Repository\ClientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/clients/import')]
class ClientImportController extends AbstractController
{
    #[Route('', name: 'api_clients_import', methods: ['POST'])]
    public function import(Request $request, EntityManagerInterface $em, ClientRepository $clientRepo): JsonResponse
    {
        $file = $request->files->get('file');
        if (!$file) {
            return $this->json(['error' => 'No file was uploaded.'], 400);
        }

        if ($file->getClientOriginalExtension() !== 'csv') {
            return $this->json(['error' => 'Invalid file type. Only CSV files are allowed.'], 400);
        }

        $handle = fopen($file->getPathname(), 'r');
        
        $header = fgetcsv($handle); 
        
        $importedCount = 0;
        $skippedCount = 0;

        while (($row = fgetcsv($handle)) !== false) {
            $name = $row[0] ?? null;
            $email = $row[1] ?? null;
            $company = $row[2] ?? null;
            $address = $row[3] ?? null;

            if (!$email || !$name) {
                $skippedCount++;
                continue;
            }

            if ($clientRepo->findOneBy(['email' => $email])) {
                $skippedCount++;
                continue; 
            }

            $client = new Client();
            $client->setName($name);
            $client->setEmail($email);
            $client->setCompany($company);
            $client->setAddress($address);

            $em->persist($client);
            $importedCount++;
        }

        fclose($handle);
        $em->flush();

        return $this->json([
            'message' => 'Import completed successfully.',
            'imported' => $importedCount,
            'skipped' => $skippedCount
        ], 200);
    }
}