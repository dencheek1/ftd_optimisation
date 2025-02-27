class RNG {
  static kiss_x = 1;
  static kiss_y = 2;
  static kiss_z = 4;
  static kiss_w = 8;
  static kiss_carry = 0;
  static kiss_k;
  static kiss_m;

  static seed_rand_kiss(seed) {
    this.kiss_x = seed | 1;
    this.kiss_y = seed | 2;
    this.kiss_z = seed | 4;
    this.kiss_w = seed | 8;
    this.kiss_carry = 0;
  }

  static rand_kiss() {
    this.kiss_x = this.kiss_x * 69069 + 1;
    this.kiss_y ^= this.kiss_y << 13;
    this.kiss_y ^= this.kiss_y >> 17;
    this.kiss_y ^= this.kiss_y << 5;
    this.kiss_k = (this.kiss_z >> 2) + (this.kiss_w >> 3) + (this.kiss_carry >> 2);
    this.kiss_m = this.kiss_w + this.kiss_w + this.kiss_z + this.kiss_carry;
    this.kiss_z = this.kiss_w;
    this.kiss_w = this.kiss_m;

    this.kiss_x = this.kiss_x >>> 0;
    this.kiss_y = this.kiss_y >>> 0;
    this.kiss_k = this.kiss_k >>> 0;
    this.kiss_m = this.kiss_m >>> 0;
    this.kiss_z = this.kiss_z >>> 0;
    this.kiss_w = this.kiss_w >>> 0;


    this.kiss_carry = this.kiss_k >> 30;
    return (this.kiss_x + this.kiss_y + this.kiss_w);
  }
}

export default RNG;