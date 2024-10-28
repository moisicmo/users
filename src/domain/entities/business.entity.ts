import { TypeBusiness } from '../dtos/business/business.dto';

export class BusinessEntity {
  constructor(
    public id: number,
    public TypeBusiness: TypeBusiness,
    public name: string,
    public url: string,
    public state: boolean,

  ) { }

  static fromObject(object: { [key: string]: any; }) {
    const { id, TypeBusiness, name, url, state } = object;
    return new BusinessEntity(id, TypeBusiness, name, url, state);
  }
}
