export class Permissions {
    perms: any = {
        "/admindeleteuser/:username": 3,
        "/newpost": 1,
        "/administration/:page": 3,
        "/settingdata": 3,
        "/setuserpermissions": 3
    }
    constructor(stack) {
        // Any route which has not explicitly set permissions will be assumed to be 'normal'.
        // Not all routes need to be manually set!
        stack.forEach(layer => this.perms[layer.route.path] = this.perms[layer.route.path] != null ? this.perms[layer.route.path] : 0)
    }
}