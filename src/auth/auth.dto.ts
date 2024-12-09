import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsNotEmpty()
  user_email: string;

  @IsString()
  @IsNotEmpty()
  user_password: string;
}
