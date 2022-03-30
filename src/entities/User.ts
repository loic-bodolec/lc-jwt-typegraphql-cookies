import { Field, ID, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
@ObjectType('UserType')
export class User extends BaseEntity {
    @Field(() => ID, { nullable: true })
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    email: string;

    @Field()
    @Column()
    password: string;

    @Field()
    @Column()
    state: string;

    @Field()
    @Column()
    role: string;

    @Column()
    createdAt: string;
}