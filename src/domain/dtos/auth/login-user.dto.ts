import { regularExps } from '../../../config';
import { TypeContact } from '../user/user.dto';

export class LoginUserDto {
  private constructor(
    public data: string,
    public typeContact: TypeContact,
    public password: string
  ) {}

  static create(object: { [key: string]: any }): [string?, LoginUserDto?] {
    const { data, typeContact, password } = object;

    if (!data) return ['El email es obligatorio'];
    if (typeContact == 'EMAIL') {
      if (!regularExps.email.test(data)) return ['el correo no es valido'];
    }
    if (!password) return ['El password es obligatorio'];
    if (password.length < 6)
      return ['La contraseña debe de ser más de 5 caracteres'];

    return [undefined, new LoginUserDto(data, typeContact, password)];
  }
}
