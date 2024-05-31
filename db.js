import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb+srv://tarunbasediya020:T20python14%40@cluster0.cehqehb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
