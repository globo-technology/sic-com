import {Component, OnDestroy, OnInit} from '@angular/core';
import {Pedido} from '../../models/pedido';
import {Cliente} from '../../models/cliente';
import {PedidosService} from '../../services/pedidos.service';
import {AvisoService} from '../../services/aviso.service';
import {Usuario} from '../../models/usuario';
import {ClientesService} from '../../services/clientes.service';
import {AuthService} from '../../services/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'sic-com-pedidos',
  templateUrl: 'pedidos.component.html',
  styleUrls: ['pedidos.component.scss']
})
export class PedidosComponent implements OnInit, OnDestroy {

  cliente: Cliente = null;
  pedidos: Array<Pedido> = [];
  pagina = 0;
  totalPaginas = 0;
  tamanioPagina = 5;
  loading = false;
  buscarPedidosSubscription: Subscription;
  clienteDelUsuarioSubscription: Subscription;

  constructor(private pedidosService: PedidosService, private avisoService: AvisoService,
              private authService: AuthService, private clientesService: ClientesService) {}

  ngOnInit() {
    this.authService.getLoggedInUsuario().subscribe(
      (usuario: Usuario) => {
        this.clienteDelUsuarioSubscription = this.clientesService.getClienteDelUsuario(usuario.id_Usuario).subscribe(
          (cliente: Cliente) => {
            if (cliente) {
              this.cliente = cliente;
              this.cargarPedidos(true);
            }
          });
      }
    );
  }

  ngOnDestroy() {
    this.clienteDelUsuarioSubscription.unsubscribe();
    this.buscarPedidosSubscription.unsubscribe();
  }

  cargarPedidos(reset: boolean) {
    if (reset) {
      this.pedidos = [];
      this.pagina = 0;
    }
    this.loading = true;
    this.buscarPedidosSubscription = this.pedidosService.getPedidosCliente(this.cliente, this.pagina, this.tamanioPagina).subscribe(
      data => {
        data['content'].forEach(p => this.pedidos.push(p));
        this.totalPaginas = data['totalPages'];
        this.loading = false;
      },
      err => {
        this.avisoService.openSnackBar(err.error, '', 3500);
        this.loading = false;
      }
    );
  }

  masPedidos() {
    if ((this.pagina + 1) < this.totalPaginas) {
      this.pagina++;
      this.cargarPedidos(false);
    }

  }
}