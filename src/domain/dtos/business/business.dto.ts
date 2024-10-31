export class BusinessDto {

  private constructor(
    public readonly typeBusiness: TypeBusiness,
    public readonly name: string,
    public readonly url: string,
  ) { }


  static body(object: { [key: string]: any }): [string?, BusinessDto?] {

    const { typeBusiness, name, url } = object;

    if (!typeBusiness) return ['El tipo de negocio es obligatorio'];
    if (!name) return ['El nombre es obligatorio'];
    if (!url) return ['La dirección es obligatorio'];

    return [undefined, new BusinessDto(typeBusiness, name, url)];

  }

}

export enum TypeBusiness {
  ADMINISTRACION = 'ADMINISTRACION',
  SERVICIO = 'SERVICIO',
  TIENDA = 'TIENDA',
  RESTAURANT = 'RESTAURANT',
  HOTEL = 'HOTEL',
  CAPACITACION = 'CAPACITACION',
  INSTITUTO = 'INSTITUTO',
  COLEGIO = 'COLEGIO',
  TRANSPORTE = 'TRANSPORTE',
}
