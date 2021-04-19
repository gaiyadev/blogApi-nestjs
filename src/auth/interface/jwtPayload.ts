import { Roles } from '../enums/role.enum';

export interface JwtPayload {
  id: number;
  email: string;
  username: string;
  role: Roles;
}
