export class Usuario {
  id!: number;
  username!: string;
  password!: string;
  clave2!: string;
  personaCodigo!: number;
  personaNombre!: string;
  personaApellido!: string;
  uaaCodigo!: number;
  uaaNombre!: string;
  roles: string[] = [];
  horaInicioSesion!: string;
}
