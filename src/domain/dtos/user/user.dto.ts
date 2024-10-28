export class UserDto {
  constructor(
    public readonly dni: string,
    public readonly name: string,
    public readonly lastName: string,
    public readonly typeContact: TypeContact,
    public readonly data: string,
  ) { }

  static body(object: { [key: string]: any }): [string?, UserDto?] {
    const { dni, name, lastName, typeContact,data } = object;

    if (!dni) return ['El número de carnet es obligatorio'];
    if (!name) return ['El nombre es obligatorio'];
    if (!lastName) return ['El apellido es obligatorio'];
    if (!typeContact) return ['El tipo de contacto es necesario'];
    if (!data) return ['El contacto es obligatorio'];

    return [undefined, new UserDto(dni, name, lastName, typeContact, data)];
  }
}

export enum TypeContact {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}
