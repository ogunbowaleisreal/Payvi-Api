import { UserRepository } from "../../repository/user.repository.js";
import { toUserResponse } from "../../utils/user.utils.js";
import type { UpdateProfileInput } from "../../interfaces/users/user.interface.js";

export class AccountService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository =
            new UserRepository();
    }

    async updateTwoFactorStatus(
        userId: number,
        enabled: boolean
    ): Promise<void> {
        await this.userRepository.updateTwoFactorStatus(
            userId,
            enabled
        );
    }

    async updateProfile(
        userId: number,
        data: UpdateProfileInput
    ) {
        const user =
            await this.userRepository.updateProfile(
                userId,
                data
            );

        return toUserResponse(user);
    }
}