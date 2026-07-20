import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.7";

const config = window.STUDYTRACK_PUBLIC_CONFIG;
const status = document.querySelector("#status");
const emailForm = document.querySelector("#email-form");
const deleteForm = document.querySelector("#delete-form");
const confirmation = document.querySelector("#confirmation");
const understood = document.querySelector("#understood");
const deleteButton = deleteForm.querySelector("button");
const supportLink = document.querySelector("#support-link");

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
}

if (
  !config?.supabaseUrl ||
  !config?.supabasePublishableKey ||
  !config?.supportEmail
) {
  setStatus(
    "This page is not configured. Please contact the StudyTrack owner.",
    true,
  );
  emailForm.hidden = true;
} else {
  supportLink.href = `mailto:${config.supportEmail}`;
  const supabase = createClient(
    config.supabaseUrl,
    config.supabasePublishableKey,
    {
      auth: { persistSession: true, detectSessionInUrl: true },
    },
  );

  const refreshState = async () => {
    const { data } = await supabase.auth.getSession();
    const verified = Boolean(data.session);
    emailForm.hidden = verified;
    deleteForm.hidden = !verified;
    if (verified)
      setStatus(
        "Account ownership verified. Review the warning and confirm deletion.",
      );
  };

  emailForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("Sending verification link…");
    const email = new FormData(emailForm).get("email");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.href.split("#")[0].split("?")[0],
      },
    });
    setStatus(
      error
        ? "The verification link could not be sent. Please try again."
        : "Check your email for the secure verification link.",
      Boolean(error),
    );
  });

  const updateDeleteButton = () => {
    deleteButton.disabled =
      confirmation.value !== "DELETE" || !understood.checked;
  };
  confirmation.addEventListener("input", updateDeleteButton);
  understood.addEventListener("change", updateDeleteButton);

  deleteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (deleteButton.disabled) return;
    deleteButton.disabled = true;
    setStatus("Deleting your account and associated data…");
    const { data, error } = await supabase.functions.invoke(
      "delete-user-account",
      {
        body: { confirmation: "DELETE" },
      },
    );
    if (error || !data?.deleted) {
      deleteButton.disabled = false;
      setStatus(
        "Your account could not be deleted. Please contact support or try again.",
        true,
      );
      return;
    }
    await supabase.auth.signOut({ scope: "local" });
    deleteForm.hidden = true;
    setStatus(
      "Your StudyTrack account and associated data have been permanently deleted.",
    );
  });

  void refreshState();
}
