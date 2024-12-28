import {
  ChangePasswordDto,
  CustomError,
  CustomSuccessful,
  LoginUserDto,
  UserEntity,
  ValidateUserDto,
} from '@/domain';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { bcryptAdapter, JwtAdapter } from '@/config';
import { EmailService } from '..';

const prisma = new PrismaClient();

export class AuthService {

  constructor(
    private readonly emailService: EmailService
  ) { }

  public async loginUser(dto: LoginUserDto) {

    const user = await prisma.users.findFirst({
      where: {
        contacts: {
          some: {
            typeContact: dto.typeContact,
            data: dto.data,
          },
        },
      },
      include: {
        contacts: true,
        staff: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
        student: true,
        teacher: true,
        customer: true,
        player:true,
        branches: {
          include: {
            business: true,
          }
        },
      }
    })
    if (!user) throw CustomError.badRequest('No se pudo autenticar al usuario');
    console.log(JSON.stringify(user))
    const isMatching = bcryptAdapter.compare(
      dto.password,
      user.password
    );
    if (!isMatching) throw CustomError.badRequest('La Contraseña no es valida');
    
    if (!user.contacts[0].validated) {
      const codeValidation = await this.sendEmailValidationLink(
        dto.data
      );
      await prisma.contacts.update({
        where: { 
          userId: user.id,
          typeContact: user.contacts[0].typeContact, 
        },
        data: {
          codeValidation: await bcryptAdapter.hash(codeValidation)
        },
      });
      return CustomSuccessful.response({
        statusCode: 1,
        message: 'Es necesario validar'
      });
    }
    const token = await JwtAdapter.generateToken({ id: user.id });
    if (!token) throw CustomError.internalServer('Error al crear la llave');
    const { ...userEntity } = UserEntity.fromObjectAuth(user);

    return CustomSuccessful.response({
      result: {
        user: userEntity,
        token: token,
      },
    });
  }

  public validateEmail = async (dto: ValidateUserDto) => {
    try {
      const contact = await prisma.contacts.findFirst({
        where:{
          data:dto.data
        }
      });
      if(!contact)throw CustomError.badRequest(`No existe el registro ${dto.data}`);
      if(!contact.codeValidation)throw CustomError.badRequest(`No se registro un código de validación`);
      const isMatching = bcryptAdapter.compare(
        dto.code,
        contact.codeValidation
      );
      if (!isMatching) throw CustomError.badRequest('El código es incorrecto');
      await prisma.contacts.update({
        where:{
          userId:contact.userId,
          data:dto.data
        },
        data: { validated: true },
      });
      await this.sendEmailValidationSuccess(dto.data);
      return CustomSuccessful.response({ message: 'Verificación correcta' });
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  };

  public changePassword = async (dto:ChangePasswordDto)=>{
    try {
      const contact = await prisma.contacts.findFirst({
        where:{
          data:dto.data
        }
      });
      if(!contact)throw CustomError.badRequest(`No existe el registro ${dto.data}`);
      if(!contact.codeValidation)throw CustomError.badRequest(`No se registro un código de validación`);
      const isMatching = bcryptAdapter.compare(
        dto.code,
        contact.codeValidation
      );
      if (!isMatching) throw CustomError.badRequest('El código es incorrecto');
      await prisma.users.update({
        where:{
          id:contact.userId,
        },
        data: { password: await bcryptAdapter.hash(dto.newPassword) },
      });
      return CustomSuccessful.response({ message: 'Cambio de contraseña correcto' });
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  private sendEmailValidationLink = async (email: string) => {
    const codeg = uuidv4().substring(0, 4);
    const html = `
    <div style="font-family: Arial, sans-serif; background-color: #000; color: #ffffff; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
      <div style="text-align: center; border-bottom: 2px solid #164C63; padding-bottom: 10px; margin-bottom: 20px;">
        <img src="https://scontent.flpb3-2.fna.fbcdn.net/v/t39.30808-6/315194221_503389215163142_1174042023313729159_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=w5YRpuReei8Q7kNvgHK6S2V&_nc_zt=23&_nc_ht=scontent.flpb3-2.fna&_nc_gid=At2GrTiWKjCpOHVALyzzlfs&oh=00_AYAClGjDDRevVIXtOSU8_fVJh8FPlOymIO4GOVTtZe36Tw&oe=67681A23" alt="HOLU GAMING" style="max-width: 150px; margin-bottom: 10px;" />
        <h1 style="color: #F79009; font-size: 24px; margin: 0;">¡Valida tu correo electrónico!</h1>
      </div>
      <p style="font-size: 16px; line-height: 1.5; text-align: center;">
        Gracias por unirte a <strong>HOLU GAMING</strong>. Para completar el proceso de verificación de tu cuenta, 
        introduce el siguiente código en la aplicación:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 36px; color: #F79009; font-weight: bold; letter-spacing: 5px; background-color: #2f2f40; padding: 10px 20px; border-radius: 5px;">
          ${codeg}
        </span>
      </div>
      <p style="font-size: 14px; text-align: center; color: #cccccc;">
        Este código expirará en 10 minutos. Si no solicitaste este correo, ignóralo.
      </p>
      <div style="margin-top: 30px; text-align: center; border-top: 2px solid #164C63; padding-top: 10px;">
        <p style="font-size: 12px; color: #999999;">
          HOLU GAMING © 2024. Todos los derechos reservados.
        </p>
        <a href="#" style="color: #164C63; text-decoration: none; font-size: 12px;">Términos y condiciones</a> | 
        <a href="#" style="color: #164C63; text-decoration: none; font-size: 12px;">Política de privacidad</a>
      </div>
    </div>
  `;
  
    const options = {
      from: `"HOLU GAMING" <${process.env.MAILER_EMAIL}>`,
      to: email,
      subject: 'Valida tu cuenta - HOLU GAMING',
      htmlBody: html,
    };
  
    const isSent = await this.emailService.sendEmail(options);
    if (!isSent) throw CustomError.internalServer('Error al enviar el correo');
  
    return codeg;
  };
  
  private sendEmailValidationSuccess = async (email: string) => {
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #1a1a2e; color: #ffffff; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
        <div style="text-align: center; border-bottom: 2px solid #28a745; padding-bottom: 20px; margin-bottom: 20px;">
        <img src="https://scontent.flpb3-2.fna.fbcdn.net/v/t39.30808-6/315194221_503389215163142_1174042023313729159_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=w5YRpuReei8Q7kNvgHK6S2V&_nc_zt=23&_nc_ht=scontent.flpb3-2.fna&_nc_gid=At2GrTiWKjCpOHVALyzzlfs&oh=00_AYAClGjDDRevVIXtOSU8_fVJh8FPlOymIO4GOVTtZe36Tw&oe=67681A23" alt="HOLU GAMING" style="max-width: 150px; margin-bottom: 10px;" />
          <h1 style="color: #28a745; font-size: 24px; margin: 0;">¡Tu cuenta ha sido validada exitosamente!</h1>
        </div>
        <p style="font-size: 16px; line-height: 1.6; text-align: center;">
          Felicidades, <strong>HOLU GAMER</strong>.<br>
          Ahora puedes disfrutar de toda la experiencia de nuestra plataforma.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://holu.lat" target="_blank" style="display: inline-block; font-size: 16px; color: #ffffff; background-color: #28a745; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 10px;">
            Ir a HOLU GAMING
          </a>
        </div>
        <p style="font-size: 14px; text-align: center; color: #cccccc; margin-top: 30px;">
          Si tienes alguna duda o problema, no dudes en contactarnos a través de nuestro soporte.
        </p>
        <div style="margin-top: 30px; text-align: center; border-top: 2px solid #28a745; padding-top: 10px;">
          <p style="font-size: 12px; color: #999999;">
            HOLU GAMING © 2024. Todos los derechos reservados.
          </p>
          <a href="#" style="color: #28a745; text-decoration: none; font-size: 12px;">Términos y condiciones</a> | 
          <a href="#" style="color: #28a745; text-decoration: none; font-size: 12px;">Política de privacidad</a>
        </div>
      </div>
    `;
  
    const options = {
      from: `"HOLU GAMING" <${process.env.MAILER_EMAIL}>`,
      to: email,
      subject: 'Cuenta validada - HOLU GAMING',
      htmlBody: html,
    };
  
    const isSent = await this.emailService.sendEmail(options);
    if (!isSent) throw CustomError.internalServer('Error al enviar el correo');
  };
  
}
