const errorHandler = (err, req, res, next) => {
    console.log(err.stack.cyan.underline);

    const error = {...err};
    error.message = err.message;

    if(error.name === 'CastError'){
        error.message = 'Энэ ID буруу бүтэцтэй ID байна';
        error.statusCode = 400;
    }

    if(error.code === 11000){
        error.message = 'Энэ талбарын утгыг давхардуулж өгч болохгүй';
        error.statusCode = 400;
    }

    if(error.name === 'JsonWebTokenError' && error.message === 'invalid token'){
        error.message = 'Буруу токен дамжуулсан байна.';
        error.statusCode = 400;
    }


    if(error.message === 'jwt malformed'){
        error.message = 'Та системд нэвтэрч орсны дараа уг үйлдлийг гүйцэтгэх боломжтой. 🐰';
        error.statusCode = 401;
    }


    res.status(error.statusCode || 500).json({
        success: false,
        error: error,
    })
}

module.exports =  errorHandler;