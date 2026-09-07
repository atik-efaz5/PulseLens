/**
 * PulseLens Prescription UI
 */
function PrescriptionUI() {
  this.state = 'HIDDEN';
}

PrescriptionUI.prototype.showResult = function (result) {
  if (result.blocked) {
    this.state = 'WARNING';
    print('[RxUI] BLOCKED: ' + (result.message || ''));
    if (result.alternatives && result.alternatives.length) {
      print('[RxUI] Alternative: ' + result.alternatives[0].medication);
    }
  } else {
    this.state = 'SUCCESS';
    print('[RxUI] PENDING: Prescription logged');
  }
  var self = this;
  setTimeout(function () { self.state = 'HIDDEN'; }, result.blocked ? 10000 : 5000);
};

PrescriptionUI.prototype.hide = function () {
  this.state = 'HIDDEN';
};

module.exports = PrescriptionUI;
