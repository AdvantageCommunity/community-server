import mongoose from 'mongoose';
export const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log('MongoDB Connected!');
  } catch (error) {
    console.log('MongoDB connection Erro: ' + error.message);
  }
};
