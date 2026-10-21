// Opens the FAQ entry that the URL hash points to (e.g. Help.html#delete-account),
// also when the hash changes while the page is open (links like "#forgot-password").
function openEntryFromHash() {
    let id = "";
    try {
        id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
        return; // malformed hash, e.g. "#%"
    }
    if (!id) return;

    const target = document.getElementById(id);
    if (target && target.tagName === "DETAILS") {
        target.open = true;
        target.scrollIntoView({ block: "start" });
    }
}

window.addEventListener("hashchange", openEntryFromHash);
openEntryFromHash();