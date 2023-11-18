const nodemailer = require('nodemailer');



const adminEmailService = async ({ email, firstName, lastName, message }) => {
  

  let mailTranspoter = nodemailer.createTransport({
    service: "gmail",
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD
    }
  })


  let details = {
    from: process.env.USER,
    to: `${email}`,
    subject: "Sri-Bistro Admin-Reset-password",
    html: ` <div style="background-color: antiquewhite; margin-left:25%; margin-right:25%; padding:20px;">
      <div>
        <b>Hello ${firstName} ${lastName},</b>
      </div>
      <br>
      <br>
      <div>
        Link will be expires in 10m - ${message}
      </div>
      <br>
      <footer style="text-align: center;">
        <b>Thank you</b>
      </footer>
    </div>`
  }


  mailTranspoter.sendMail(details, (err, data) => {
    if (err) {
      console.log('Error' + err);
    } else {
      console.log('Email send');
    }
  })


}

module.exports =  {adminEmailService} 
