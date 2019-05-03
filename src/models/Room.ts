import { Client } from './Client';

export class Room<T = any> {
	public readonly id: string;
	public readonly name: string;
	public readonly clients: Client[];
}
