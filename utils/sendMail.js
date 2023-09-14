import nodemailer from 'nodemailer';
const sendMail = async (email, subject, content) => {
  try {
    const transport = nodemailer.createTransport({
      port: Number(process.env.EMAIL_PORT),
      host: process.env.HOST,
      service: process.env.SERVICE,
      secure: Boolean(process.env.SECURE),
      auth: {
        user: 'grow.advantagedigital@gmail.com',
        pass: 'vcnzpxuhjbefngzn',
      },
    });
    await transport.sendMail({
      from: process.env.USER_EMAIL,
      to: email,
      subject,
      text: content,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.log('Error while sending email : ' + error);
  }
};
export default sendMail;
