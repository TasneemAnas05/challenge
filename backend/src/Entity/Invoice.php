<?php

namespace App\Entity;

use App\Repository\InvoiceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InvoiceRepository::class)]
class Invoice
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $invoiceNumber = null;

    #[ORM\Column(length: 50)]
    private ?string $status = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 12, scale: 2)]
    private ?string $totalAmountNet = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 12, scale: 2)]
    private ?string $totalAmountVat = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 12, scale: 2)]
    private ?string $totalAmountGross = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private ?\DateTimeImmutable $invoiceDate = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private ?\DateTimeImmutable $dueDate = null;

    #[ORM\ManyToOne(inversedBy: 'invoices')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Client $client = null;

    /**
     * @var Collection<int, InvoiceItem>
     */
    #[ORM\OneToMany(targetEntity: InvoiceItem::class, mappedBy: 'invoice', orphanRemoval: true)]
    private Collection $invoiceItems;

    public function __construct()
    {
        $this->invoiceItems = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getInvoiceNumber(): ?string
    {
        return $this->invoiceNumber;
    }

    public function setInvoiceNumber(string $invoiceNumber): static
    {
        $this->invoiceNumber = $invoiceNumber;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getTotalAmountNet(): ?string
    {
        return $this->totalAmountNet;
    }

    public function setTotalAmountNet(string $totalAmountNet): static
    {
        $this->totalAmountNet = $totalAmountNet;

        return $this;
    }

    public function getTotalAmountVat(): ?string
    {
        return $this->totalAmountVat;
    }

    public function setTotalAmountVat(string $totalAmountVat): static
    {
        $this->totalAmountVat = $totalAmountVat;

        return $this;
    }

    public function getTotalAmountGross(): ?string
    {
        return $this->totalAmountGross;
    }

    public function setTotalAmountGross(string $totalAmountGross): static
    {
        $this->totalAmountGross = $totalAmountGross;

        return $this;
    }

    public function getInvoiceDate(): ?\DateTimeImmutable
    {
        return $this->invoiceDate;
    }

    public function setInvoiceDate(\DateTimeImmutable $invoiceDate): static
    {
        $this->invoiceDate = $invoiceDate;

        return $this;
    }

    public function getDueDate(): ?\DateTimeImmutable
    {
        return $this->dueDate;
    }

    public function setDueDate(\DateTimeImmutable $dueDate): static
    {
        $this->dueDate = $dueDate;

        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): static
    {
        $this->client = $client;

        return $this;
    }

    /**
     * @return Collection<int, InvoiceItem>
     */
    public function getInvoiceItems(): Collection
    {
        return $this->invoiceItems;
    }

    public function addInvoiceItem(InvoiceItem $invoiceItem): static
    {
        if (!$this->invoiceItems->contains($invoiceItem)) {
            $this->invoiceItems->add($invoiceItem);
            $invoiceItem->setInvoice($this);
        }

        return $this;
    }

    public function removeInvoiceItem(InvoiceItem $invoiceItem): static
    {
        if ($this->invoiceItems->removeElement($invoiceItem)) {
            // set the owning side to null (unless already changed)
            if ($invoiceItem->getInvoice() === $this) {
                $invoiceItem->setInvoice(null);
            }
        }

        return $this;
    }
}
