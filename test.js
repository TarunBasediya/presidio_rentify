import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const testPasswordComparison = async () => {
    // Simulated registration process
    const plainPassword = 'rudy20';  // Change this to a password you want to test
    try {
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        console.log('Hashed password:', hashedPassword);

        // Simulated login process with the correct password
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        console.log('Password match with correct password:', isMatch);

        // Simulated login process with an incorrect password
        const wrongPassword = 'wrongPassword';
        const isMatchWrong = await bcrypt.compare(wrongPassword, hashedPassword);
        console.log('Password match with incorrect password:', isMatchWrong);
    } catch (error) {
        console.error('Error during password comparison:', error.message);
    }
};


const secret = crypto.randomBytes(64).toString('hex');
console.log(secret);

// Run the test
testPasswordComparison();
