import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'กรุณากรอกชื่อผู้ส่ง' })
  @IsString()
  senderName: string;

  @IsNotEmpty({ message: 'กรุณากรอกข้อความ' })
  @IsString()
  @Matches(/^[ \u0E00-\u0E7F0-9\s\n\r]+$/, {
    message: 'ข้อความ Comment ต้องเป็นภาษาไทยและ/หรือตัวเลขเท่านั้น',
  })
  content: string;
}
