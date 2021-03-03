import * as core from '@actions/core';
import {
  getOpenPRs,
  getAutoUpdateCandidate,
  updatePRBranch,
  replacePreviousComment,
  deleteExistingComments,
} from './lib/github';
import { log } from './lib/util';

async function main() {
  try {
    const openPRs = await getOpenPRs();
    const commentMarker = "<!--NO-AUTO-UPDATE-->"

    const prGenerator = getAutoUpdateCandidate(openPRs);
    for await(const pr of prGenerator) {
      const { number: pullNumber } = pr;
      // update the pr
      log(`Trying to update the branch of PR #${pullNumber}`);

      try {
        await updatePRBranch(pullNumber);
        log('Successfully updated. Cheers 🎉!');
        await deleteExistingComments(commentMarker, pullNumber);
      } catch (err) {
        core.setFailed(`Fail to update PR with error: ${err}`);
        await replacePreviousComment(commentMarker, pullNumber,
         'Could not update branch. Most likely this is due to a ' +
         'merge conflict. Please update the branch manually and ' +
         `fix any issues. Error: ${err}`)
      }
    }
  } catch (err) {
    core.setFailed(`Action failed with error ${err}`);
  }
}

main();
