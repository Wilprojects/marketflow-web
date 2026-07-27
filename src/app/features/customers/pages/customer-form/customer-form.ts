import { Component, inject, OnInit } from '@angular/core';
import { CreateCustomerRequest, CustomerDocumentType } from '../../models/customer.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomersService } from '../../services/customers.service';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { getApiErrorMessage } from '../../../../core/utils/error-message.util';

/**
 * Opción para el select de tipo de documento.
 */
interface DocumentTypeOption {
  value: CustomerDocumentType;
  label: string;
}

/**
 * Formulario de cliente.
 *
 * Se usa para:
 * - crear cliente
 * - editar cliente
 *
 * La diferencia se detecta por la URL:
 * - /customers/new       -> crear
 * - /customers/:id/edit  -> editar
 */
@Component({
  selector: 'app-customer-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.css',
})
export class CustomerForm implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly customersService = inject(CustomersService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /**
   * Id recibido desde la URL.
   *
   * Si existe, estamos en modo edición.
   */
  private customerId: string | null = null;

  /**
   * Indica si el formulario está creando o editando.
   */
  isEditMode = false;

  /**
   * Estado de carga cuando se consulta un cliente existente.
   */
  isLoading = false;

  /**
   * Estado de guardado.
   */
  isSaving = false;

  /**
   * Mensaje de error visible para el usuario.
   */
  errorMessage: string | null = null;

  /**
   * Opciones del tipo de documento.
   */
  readonly documentTypes: DocumentTypeOption[] = [
    {
      value: 'DNI',
      label: 'DNI',
    },
    {
      value: 'RUC',
      label: 'RUC',
    },
    {
      value: 'CE',
      label: 'Carnet de extranjería',
    },
    {
      value: 'PASSPORT',
      label: 'Pasaporte',
    },
    {
      value: 'OTHER',
      label: 'Otro',
    },
  ];

  /**
   * Formulario reactivo de cliente.
   */
  readonly customerForm = this.formBuilder.nonNullable.group({
    document_type: ['DNI', [Validators.required]],
    document_number: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
      ],
    ],
    first_name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
    ],
    last_name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
    ],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    phone: ['', [Validators.maxLength(20)]],
    address: ['', [Validators.maxLength(250)]],
    is_active: [true],
  });

  /**
   * Al iniciar, detectamos si estamos creando o editando.
   */
  ngOnInit(): void {
    this.customerId = this.activatedRoute.snapshot.paramMap.get('id');
    this.isEditMode = !!this.customerId;

    if (this.isEditMode && this.customerId) {
      this.loadCustomer(this.customerId);
    }
  }

  /**
   * Getters para simplificar validaciones en el HTML.
   */
  get documentType() {
    return this.customerForm.controls.document_type;
  }

  get documentNumber() {
    return this.customerForm.controls.document_number;
  }

  get firstName() {
    return this.customerForm.controls.first_name;
  }

  get lastName() {
    return this.customerForm.controls.last_name;
  }

  get email() {
    return this.customerForm.controls.email;
  }

  get phone() {
    return this.customerForm.controls.phone;
  }

  get address() {
    return this.customerForm.controls.address;
  }

  /**
   * Carga los datos de un cliente para edición.
   */
  private loadCustomer(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.customersService
      .getCustomerById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (customer) => {
          this.customerForm.patchValue({
            document_type: customer.document_type,
            document_number: customer.document_number,
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email ?? '',
            phone: customer.phone ?? '',
            address: customer.address ?? '',
            is_active: customer.is_active,
          });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
   * Envía el formulario.
   *
   * Si estamos en modo creación, llama POST /customers.
   * Si estamos en modo edición, llama PATCH /customers/:id.
   */
  onSubmit(): void {
    this.errorMessage = null;

    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const payload = this.buildPayload();

    const request$ =
      this.isEditMode && this.customerId
        ? this.customersService.updateCustomer(this.customerId, payload)
        : this.customersService.createCustomer(payload);

    request$
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/customers');
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error);
        },
      });
  }

  /**
   * Construye el payload para enviar al backend.
   *
   * Aunque el formulario sirve para crear y editar, siempre enviamos
   * los campos principales completos.
   *
   * Además:
   * - quitamos espacios con trim()
   * - convertimos campos opcionales vacíos a null
   */
  private buildPayload(): CreateCustomerRequest {
    const rawValue = this.customerForm.getRawValue();

    const email = rawValue.email.trim();
    const phone = rawValue.phone.trim();
    const address = rawValue.address.trim();

    return {
      document_type: rawValue.document_type as CustomerDocumentType,
      document_number: rawValue.document_number.trim(),
      first_name: rawValue.first_name.trim(),
      last_name: rawValue.last_name.trim(),
      email: email.length > 0 ? email : null,
      phone: phone.length > 0 ? phone : null,
      address: address.length > 0 ? address : null,
      is_active: rawValue.is_active,
    };
  }
}
