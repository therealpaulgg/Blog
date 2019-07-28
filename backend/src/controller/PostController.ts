import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { Post } from "../entity/Post";

export class PostController {

    private postRepository = getRepository(Post);

    async all(request: Request, response: Response, next: NextFunction) {
        return this.postRepository.find();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.postRepository.findOne(request.params.id);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        return this.postRepository.save(request.body);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.postRepository.findOne(request.params.id);
        await this.postRepository.remove(userToRemove);
    }

}