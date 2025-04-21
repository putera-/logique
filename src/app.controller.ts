import { Controller, Get, Res } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    root(@Res() res) {
        res.status(302).redirect('/api');
    }
}
