import { Request, Response } from 'express';
import { ChangePasswordDto, CustomError, LoginUserDto, ValidateUserDto } from '@/domain';
import { AuthService } from '@/presentation';

export class AuthController {
  
  constructor(public readonly authService: AuthService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);
    return res.status(500).json({ error: 'Internal server error' });
  };

  loginUser = (req: Request, res: Response) => {
    const [error, loginUserDto] = LoginUserDto.create(req.body);
    if (error) return res.status(400).json({ error });

    this.authService
      .loginUser(loginUserDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  validateEmail = (req: Request, res: Response) => {
    const [error, validateUserDto] = ValidateUserDto.create(req.body);
    if (error) return res.status(400).json({ error });
    this.authService
      .validateEmail(validateUserDto!)
      .then((result) => res.json(result))
      .catch((error) => this.handleError(error, res));
  };

  changePassword = (req: Request, res: Response) => {
    const [error, changePasswordDto] = ChangePasswordDto.create(req.body);
    if (error) return res.status(400).json({ error });
    this.authService
      .changePassword(changePasswordDto!)
      .then((result) => res.json(result))
      .catch((error) => this.handleError(error, res));
  };
}
