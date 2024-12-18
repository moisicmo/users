export class ChangePasswordDto {

  private constructor(
    public code: string,
    public data: string,
    public newPassword: string,
  ) { }

  static create(object: { [key: string]: any }): [string?, ChangePasswordDto?] {
    const { code, data, newPassword } = object;

    if (!code) return ['El código es obligatorio'];
    if (!data) return ['La data es obligatorio'];
    if (!newPassword) return ['La nueva Contraseña es necesario'];

    return [undefined, new ChangePasswordDto(code, data, newPassword)];

  }
}