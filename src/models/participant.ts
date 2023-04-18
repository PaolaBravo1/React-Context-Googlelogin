export class Participant {
    public id: number;
    public emailAddress: string;
    public internalID: string;
    public firstName: string;
    public middleName: string;
    public lastName: string;
    public address: string;
    public address2: string;
    public city: string;
    public state: string; 
    public postalCode: string;
    public fullName: string;
    public dateOfBirth: Date | null;
    public lastActiveTimestamp: Date | null;
}

