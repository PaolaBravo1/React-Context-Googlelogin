export class Identity {
    public emailAddress: string;
    public role: string;
    public nonce: string | null;
    public expiration: string;

    constructor(_emailAddress: string, _role: string, _nonce: string | null, _expiration: string) {
        this.emailAddress = _emailAddress;
        this.role = _role;
        this.nonce = _nonce;  
        this.expiration = _expiration;      
    }
    
    static parse(json: string) {
        try {
            const data = JSON.parse(json);
            return new Identity(data.emailAddress, data.role, data.nonce, data.expiration);
        } catch (e) {
            return null;
        }
    }
}

