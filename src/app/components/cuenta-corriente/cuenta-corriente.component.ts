import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {AvisoService} from '../../services/aviso.service';
import {CuentasCorrienteService} from '../../services/cuentas-corriente.service';
import {RenglonCuentaCorriente} from '../../models/renglon-cuenta-corriente';
import {finalize} from 'rxjs/operators';
import {NuevaOrdenDePago} from '../../models/nueva-orden-de-pago';
import {Movimiento} from '../../models/movimiento';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'sic-com-cuenta-corriente',
  templateUrl: 'cuenta-corriente.component.html',
  styleUrls: ['cuenta-corriente.component.scss']
})
export class CuentaCorrienteComponent implements OnInit {

  cliente: Cliente = null;
  isLoading = false;
  loading = false;
  isPagoLoading = false;
  cuentaCorriente = null;
  renglones = [];
  pagina = 0;
  totalPaginas = 0;

  nuevaOrdenDePago: NuevaOrdenDePago = {
    movimiento: Movimiento.DEPOSITO,
    idSucursal: environment.idSucursal,
    tipoDeEnvio: null,
    monto: 0.00,
  };

  constructor(private authService: AuthService,
              private avisoService: AvisoService,
              private clientesService: ClientesService,
              private cuentasCorrienteService: CuentasCorrienteService) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.clientesService.getClienteDelUsuario(this.authService.getLoggedInIdUsuario())
      .subscribe(
        (cliente: Cliente) => {
          if (cliente) {
            this.cliente = cliente;
            this.reloadCuentaCorriente();
          } else {
            this.isLoading = false;
          }
        },
        err => {
          this.avisoService.openSnackBar(err.error, '', 3500);
          this.isLoading = false;
        }
      )
    ;
  }

  reloadCuentaCorriente() {
    if (!this.isLoading) {
      this.isLoading = true;
    }
    this.cuentasCorrienteService.getCuentaCorriente(this.cliente)
      .subscribe(
        cc => {
          if (cc) {
            this.cuentaCorriente = cc;
            this.cargarRenglones(true);
          } else {
            this.isLoading = false;
          }
        },
        err => {
          this.avisoService.openSnackBar(err.error, '', 3500);
          this.isLoading = false;
        }
      );
  }

  cargarRenglones(reset: boolean) {
    if (reset) {
      this.renglones = [];
      this.pagina = 0;
    }
    this.loading = true;
    this.cuentasCorrienteService.getCuentaCorrienteRenglones(this.cuentaCorriente, this.pagina)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.isLoading = false;
        })
      )
      .subscribe(
        data => {
          data['content'].forEach(r => this.renglones.push(r));
          this.totalPaginas = data['totalPages'];
        },
        err => {
          this.avisoService.openSnackBar(err.error, '', 3500);
        }
      );
  }

  masRenglones() {
    if ((this.pagina + 1) < this.totalPaginas) {
      this.pagina++;
      this.cargarRenglones(false);
    }
  }

  getMovimiento(renglon: RenglonCuentaCorriente): string {
    const tc = renglon.tipoComprobante;

    if (tc.startsWith('FACTURA_') || tc.startsWith('PRESUPUESTO')) {
      return 'COMPRA';
    }

    if (tc.startsWith('RECIBO')) {
      return 'PAGO';
    }

    if (tc.startsWith('NOTA_CREDITO_')) {
      return 'N. CRÉDITO';
    }

    if (tc.startsWith('NOTA_DEBITO_')) {
      return 'N. DÉBITO';
    }

    return '';
  }
}
