import toast from "react-hot-toast";

export function confirmToast(message, onConfirm) {
  toast.custom(
    (t) => (
      <div
        className={`max-w-(--breakpoint-sm) w-full rounded-xl p-4 bg-accent-light border-2 border-primary shadow-lg transition 
      ${t.visible ? "animate-fadeIn" : "animate-fadeOut"}`}
      >
        <p className="text-secondary mb-4">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            className="btn btn-outline"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    ),
    { duration: Infinity }
  );
}
