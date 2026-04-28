<?php

namespace App\Controller\Api;

use App\Entity\Client;
use App\Repository\ClientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/clients')]
class ClientController extends AbstractController
{
    #[Route('', name: 'api_clients_list', methods: ['GET'])]
    public function index(Request $request, ClientRepository $clientRepository): JsonResponse
    {
        $search = $request->query->get('q');

        $clients = $search
            ? $clientRepository->findBySearchTerm($search)
            : $clientRepository->findAll();

        return $this->json($clients, 200, [], ['groups' => 'client:read']);
    }

    #[Route('', name: 'api_clients_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['name']) || empty($data['email'])) {
            return $this->json(['error' => 'Name and email are required'], 400);
        }

        $client = new Client();
        $client->setName($data['name']);
        $client->setEmail($data['email']);

        $client->setCompany($data['company'] ?? null);
        $client->setAddress($data['address'] ?? null);

        $em->persist($client);
        $em->flush();

        return $this->json($client, 201, [], ['groups' => 'client:read']);
    }
}
