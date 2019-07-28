export class Post {
    public id: number;
    public url_title: string;
    public title: string;
    public content: string;
    constructor(id: number, url_title: string, title: string, content: string) {
        this.id = id
        this.url_title = url_title
        this.title = title
        this.content = content
    }
}