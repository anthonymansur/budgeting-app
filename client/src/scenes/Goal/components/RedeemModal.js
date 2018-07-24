import React from "react";
import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from "reactstrap";

export default ({ state, toggle, onRedeemSubmit }) => {
  return (
    <Modal isOpen={state.modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Redeem your goal</ModalHeader>
      <ModalBody>
        <h3>Congrats on reaching your new goal!</h3>
        <p className="small-text">
          By redeeming your goal, you won't be able to cancel it anymore nor receive back the
          money you transferred from your wallets to reach this goal. We will keep this goal
          displayed for you below for your records. (Tip: if you need to budget this goal, we
          recommend creating a new wallet with 0 percentage and inserting your goal amount
          directly.)
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onRedeemSubmit}>
          Redeem your goal
        </Button>{" "}
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}