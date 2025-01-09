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

class Compress {
  static toBinary(num) {
    const tempArr = new Array(8).fill(0);
    let tempNum = num;

    for (let i = 0; i < 8; i++) {
      if (tempNum !== 0) {
        tempArr[i] = tempNum % 2;
        tempNum = Math.floor(tempNum / 2);
      }
    }

    return tempArr.reverse().join("");
  }

  static getIndex(values, findValue) {
    return values.indexOf(findValue);
  }

  static compress(values) {
    let result = "";
    const differences = [];

    // First difference
    differences.push(values[0]);

    // Calculate remaining differences
    for (let i = 1; i < values.length; i++) {
      differences.push(values[i] - values[i - 1]);
    }

    // Encode first value
    result += this.toBinary(differences[0]);

    // Process remaining differences
    for (let i = 1; i < differences.length; i++) {
      const diff = differences[i];
      const absDiff = Math.abs(diff);

      if (absDiff < 31) {
        if (diff === 0) {
          // Handle repeating values
          result += "01";
          for (let j = 0; j < 8; j++) {
            if (
              i + j >= differences.length ||
              differences[i + j] !== 0 ||
              j === 7
            ) {
              i += j - 1;
              result += CompressionUtils.repeatArr[j - 1];
              break;
            }
          }
        } else {
          // Handle differences
          result += "00";
          if (absDiff < 3) {
            result += "00";
            result +=
              CompressionUtils.bit2Arr[
                this.getIndex(CompressionUtils.bit2Values, diff)
              ];
          } else if (absDiff < 7) {
            result += "01";
            result +=
              CompressionUtils.bit3Arr[
                this.getIndex(CompressionUtils.bit3Values, diff)
              ];
          } else if (absDiff < 15) {
            result += "10";
            result +=
              CompressionUtils.bit4Arr[
                this.getIndex(CompressionUtils.bit4Values, diff)
              ];
          } else {
            result += "11";
            result +=
              CompressionUtils.bit5Arr[
                this.getIndex(CompressionUtils.bit5Values, diff)
              ];
          }
        }
      } else {
        // Handle absolute encoding
        result += "10";
        result += diff < -30 ? "1" : "0"; // Negative or positive
        result += this.toBinary(absDiff);
      }
    }

    result += "11";
    return result;
  }
}

// Export for Node.js environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = Compress;
}
