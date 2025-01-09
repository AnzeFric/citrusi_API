// Compression utility constants
const CompressionUtils = {
  bit2Arr: ["00", "01", "10", "11"],
  bit3Arr: ["000", "001", "010", "011", "100", "101", "110", "111"],
  bit4Arr: [
    "0000",
    "0001",
    "0010",
    "0011",
    "0100",
    "0101",
    "0110",
    "0111",
    "1000",
    "1001",
    "1010",
    "1011",
    "1100",
    "1101",
    "1110",
    "1111",
  ],
  bit5Arr: [
    "00000",
    "00001",
    "00010",
    "00011",
    "00100",
    "00101",
    "00110",
    "00111",
    "01000",
    "01001",
    "01010",
    "01011",
    "01100",
    "01101",
    "01110",
    "01111",
    "10000",
    "10001",
    "10010",
    "10011",
    "10100",
    "10101",
    "10110",
    "10111",
    "11000",
    "11001",
    "11010",
    "11011",
    "11100",
    "11101",
    "11110",
    "11111",
  ],
  bit2Values: [-2, -1, 1, 2],
  bit3Values: [-6, -5, -4, -3, 3, 4, 5, 6],
  bit4Values: [
    -14, -13, -12, -11, -10, -9, -8, -7, 7, 8, 9, 10, 11, 12, 13, 14,
  ],
  bit5Values: [
    -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16,
    -15, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  ],
  repeatArr: ["000", "001", "010", "011", "100", "101", "110", "111"],
};

class Decompress {
  static getBinaryInt(binary, canNegative) {
    let result = 0;
    const size = binary.length - 1;

    if (canNegative) {
      // Positive / negative handling
      for (let i = 1; i <= size; i++) {
        result += binary[i] === "1" ? Math.pow(2, size - i) : 0;
      }
      result *= binary[0] === "0" ? 1 : -1;
    } else {
      for (let i = 0; i <= size; i++) {
        result += binary[i] === "1" ? Math.pow(2, size - i) : 0;
      }
    }
    return result;
  }

  static getValueIndex(arr, diff) {
    return arr.indexOf(diff);
  }

  static decompress(compressed) {
    const values = [];

    // First value
    const firstNum = compressed.substring(0, 8);
    values.push(this.getBinaryInt(firstNum, false));

    for (let i = 8; i < compressed.length; ) {
      const token = compressed.substring(i, i + 2);

      if (token === "00") {
        // Differences
        const bitSize = compressed.substring(i + 2, i + 4);
        if (bitSize === "00") {
          // 2 bits
          const code = compressed.substring(i + 4, i + 6);
          const index = this.getValueIndex(CompressionUtils.bit2Arr, code);
          values.push(CompressionUtils.bit2Values[index]);
          i += 2;
        } else if (bitSize === "01") {
          // 3 bits
          const code = compressed.substring(i + 4, i + 7);
          const index = this.getValueIndex(CompressionUtils.bit3Arr, code);
          values.push(CompressionUtils.bit3Values[index]);
          i += 3;
        } else if (bitSize === "10") {
          // 4 bits
          const code = compressed.substring(i + 4, i + 8);
          const index = this.getValueIndex(CompressionUtils.bit4Arr, code);
          values.push(CompressionUtils.bit4Values[index]);
          i += 4;
        } else {
          // 5 bits
          const code = compressed.substring(i + 4, i + 9);
          const index = this.getValueIndex(CompressionUtils.bit5Arr, code);
          values.push(CompressionUtils.bit5Values[index]);
          i += 5;
        }
        i += 2; // Bit size bits
      } else if (token === "01") {
        // Repetitions
        const numRepeats = compressed.substring(i + 2, i + 5);
        const index = this.getValueIndex(
          CompressionUtils.repeatArr,
          numRepeats
        );
        for (let j = 0; j <= index; j++) {
          values.push(0);
        }
        i += 3;
      } else if (token === "10") {
        // Absolute encoding
        const num = compressed.substring(i + 2, i + 11);
        values.push(this.getBinaryInt(num, true));
        i += 9;
      } else {
        // End
        break;
      }
      i += 2; // Token bits
    }

    // Add values
    for (let i = 1; i < values.length; i++) {
      values[i] += values[i - 1];
    }

    return values;
  }
}

// Export for Node.js environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = Decompress;
}
