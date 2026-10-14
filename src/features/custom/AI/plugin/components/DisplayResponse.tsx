import React from 'react'
import { Button } from 'payload/components/elements'

const DisplayResponse = ({
  buttonTitle,
  buttonAction,
  isDisabled,
  children,
}: {
  buttonTitle: string
  isDisabled: boolean
  buttonAction: () => void
  children: React.ReactNode
}) => {
  return (
    <React.Fragment>
      <div className="model-response">
        <p className="text">{children}</p>
      </div>
      <Button onClick={buttonAction} disabled={isDisabled}>
        {buttonTitle}
      </Button>
    </React.Fragment>
  )
}

export default DisplayResponse
