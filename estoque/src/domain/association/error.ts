const TAG_INTERNAL_SERVER_ERROR = '[INTERNAL SERVER ERROR]'
const TAG_PRE_CONDITION_ERROR = '[PRE CONDITION ERROR]'

class ErrorEntity {
    code: number
    message: string

    constructor(code: number, message: string) {
        this.code = code
        this.message = message
    }
}

class PreconditionError extends ErrorEntity {
    static PRECONDITION_ERROR = 1

    constructor(message: string) {
        super(PreconditionError.PRECONDITION_ERROR, message)
    }
}

class InternalServerError extends ErrorEntity {
    static INTERNAL_SERVER_ERROR = 2

    constructor(message: string) {
        super(InternalServerError.INTERNAL_SERVER_ERROR, message)
    }
}

export {
    ErrorEntity,
    PreconditionError,
    InternalServerError,
    TAG_INTERNAL_SERVER_ERROR,
    TAG_PRE_CONDITION_ERROR
}
