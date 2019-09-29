export class DateTime {
  public dateNowInMilliseconds(): number {
    return new Date().getTime();
  }

  public dateNoWInSeconds(): number {
    return Math.floor(this.dateNowInMilliseconds() / 1000);
  }
}
