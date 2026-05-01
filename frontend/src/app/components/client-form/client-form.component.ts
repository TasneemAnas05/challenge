import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss'
})
export class ClientFormComponent {
  clientForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router
  ) {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      company: [''], 
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.clientService.createClient(this.clientForm.value).subscribe({
        next: (result) => {
          console.log('Client successfully created!',result);
          this.router.navigate(['/clients']); 
        },
        error: (err) => {
          console.error('Submission failed', err);
          alert('Failed to save client to server. Please check the console for details.');
        }
      });
    } else {
      console.warn('Form is invalid!', this.clientForm.errors);
      this.clientForm.markAllAsTouched(); 
      alert('Please fill out all required fields correctly.');
    }
  }
}