import {Component, OnInit} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';

@Component({
    selector: 'sic-com-perfil',
    templateUrl: 'perfil.component.html',
})
export class PerfilComponent implements OnInit {
    usuario: Usuario = null;

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.authService.getLoggedInUsuario().subscribe(
            data => { this.usuario = data; }
        );
    }
}