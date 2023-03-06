export class Identity {
    public emailAddress: string;
    public accessToken: string;
    public refreshToken: string;
    public nonce: string | null;
    public expiration: string;

    constructor(_emailAddress: string, _accessToken: string, _refreshToken: string, _nonce: string | null, _expiration: string) {
        this.emailAddress = _emailAddress;
        this.accessToken = _accessToken;
        this.refreshToken = _refreshToken;
        this.nonce = _nonce;  
        this.expiration = _expiration;      
    }
    
    static parse(json: string) {
        const data = JSON.parse(json);
        return new Identity(data.emailAddress, data.accessToken, data.refreshToken, data.nonce, data.expiration);
    }
}

