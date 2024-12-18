export class ValidateUserDto {

  private constructor(
    public code: string,
    public data: string,
  ) {}

  static create( object: { [key:string]:any } ): [string?, ValidateUserDto?] {
    const { code,data } = object;

    if ( !code ) return ['El código es obligatorio'];
    if ( !data ) return ['La data es obligatorio'];

    return [undefined, new ValidateUserDto(code,data)];

  }


}