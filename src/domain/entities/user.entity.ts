import { BranchEntity, ContactEntity, StaffAuthEntity, StudentAuthEntity, TeacherAuthEntity } from '..';
import { CustomError } from '../responses/custom.error';

export class UserEntity {
  constructor(
    public id: number,
    public dni: string,
    public name: string,
    public lastName: string,
    public contacts: ContactEntity[],
    public branches:BranchEntity[],
    public image?: string,
    public staffs?: StaffAuthEntity,
    public students?: StudentAuthEntity,
    public teachers?: TeacherAuthEntity,
  ) {}

  static fromObjectAuth(object: { [key: string]: any }) {
    const {
      id,
      dni,
      name,
      lastName,
      image,
      staff,
      student,
      teacher,
      contacts,
      branches,
    } = object;

    if (!id) throw CustomError.badRequest('Falta id');
    if (!dni) throw CustomError.badRequest('Falta el número dni');
    if (!name) throw CustomError.badRequest('Falta el nombre');
    if (!lastName) throw CustomError.badRequest('Falta el apellido');
  
    const staffAuthEntity = staff? StaffAuthEntity.fromObject(staff): undefined;
    const studentAuthEntity = student? StudentAuthEntity.fromObject(student): undefined;
    const teacherAuthEntity = teacher? TeacherAuthEntity.fromObject(teacher): undefined;
    const contactEntity = contacts? contacts.map((e:ContactEntity)=>ContactEntity.fromObject(e)) : undefined;
    const branchesEntity = branches? branches.map((e:BranchEntity)=>BranchEntity.fromObject(e)) : undefined;



    return new UserEntity(
      id,
      dni,
      name,
      lastName,
      contactEntity,
      branchesEntity,
      image,
      staffAuthEntity,
      studentAuthEntity,
      teacherAuthEntity,
    );
  }

  static fromObject(object: { [key: string]: any }) {
    const { id, dni, name, lastName } = object;

    if (!id) throw CustomError.badRequest('Falta id');
    if (!dni) throw CustomError.badRequest('Falta el número de carnet');
    if (!name) throw CustomError.badRequest('Falta el nombre');
    if (!lastName) throw CustomError.badRequest('Falta el apellido');

    return new UserEntity(id, dni, name, lastName, [], [],undefined,undefined);
  }
}
