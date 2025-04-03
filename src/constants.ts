// object of socket id : player object
export const PLAYEROBJECTRECORD: Record<
	string,
	{
		id: string;
		avatarPath: string;
		type: string;
		x: number;
		y: number;
		z: number;
		health: number;
	}
> = {};