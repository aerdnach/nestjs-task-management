import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { Strategy, ExtractJwt } from 'passport-jwt' 
import { JwtPayload } from './jwt-payload.interface'
import { User } from './user.entity'
import { UserRepository } from './user.repository'
import * as config from 'config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        // This is needed so validate method can use UserRepository methods
        @InjectRepository(UserRepository)
        private userRepository: UserRepository  
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || config.get('jwt').secret,
        })
    }

    // Return value will be injected into any operation that is guarded with authentication
    async validate(payload: JwtPayload): Promise<User> {
        const { username } = payload
        const user = await this.userRepository.findOne({username})

        if (!user) {
            throw new UnauthorizedException()
        }

        return user
    }
}