declare interface DbMigrate {
  run(): void;
}

declare module "db-migrate" {
  export function getInstance(module: boolean, options: any): DbMigrate;
}
